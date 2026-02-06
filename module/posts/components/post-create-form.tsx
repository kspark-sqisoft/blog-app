"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "../actions/post.action";

const postSchema = z.object({
    title: z.string().min(1, "제목을 입력해주세요").max(200, "제목은 200자 이하여야 합니다"),
    content: z.string().min(1, "내용을 입력해주세요"),
    tags: z.array(z.string().min(1)).optional(),
});

type PostFormData = z.infer<typeof postSchema>;

const PostCreateForm = () => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema),
    });

    const addTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const mutation = useMutation({
        mutationFn: async (data: PostFormData) => {
            return await createPost(data.title, data.content, tags);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            reset();
            setTags([]);
            setTagInput("");
            toast.success("포스트가 작성되었습니다!");
            router.push("/posts");
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "포스트 작성에 실패했습니다");
        },
    });

    const onSubmit = async (data: PostFormData) => {
        await mutation.mutateAsync(data);
    };

    if (status === "loading") {
        return null;
    }

    if (!session) {
        return (
            <Card>
                <CardContent className="py-6">
                    <p className="text-muted-foreground text-center">
                        포스트를 작성하려면 로그인이 필요합니다.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-2 shadow-md">
            <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">포스트 작성</CardTitle>
                <CardDescription className="text-base">제목, 내용, 태그를 입력해주세요</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-semibold">
                            제목
                        </label>
                        <input
                            id="title"
                            type="text"
                            {...register("title")}
                            className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base"
                            placeholder="포스트 제목을 입력하세요"
                            disabled={isSubmitting || mutation.isPending}
                        />
                        {errors.title && (
                            <p className="text-destructive text-sm mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="block text-sm font-semibold">
                            내용
                        </label>
                        <Textarea
                            id="content"
                            {...register("content")}
                            className="w-full min-h-[300px] border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base resize-none"
                            placeholder="포스트 내용을 입력하세요"
                            disabled={isSubmitting || mutation.isPending}
                        />
                        {errors.content && (
                            <p className="text-destructive text-sm mt-1">{errors.content.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="tags" className="block text-sm font-semibold">
                            태그
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="tags"
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                className="flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                placeholder="태그를 입력하고 Enter를 누르세요"
                                disabled={isSubmitting || mutation.isPending}
                            />
                            <Button
                                type="button"
                                onClick={addTag}
                                disabled={isSubmitting || mutation.isPending || !tagInput.trim()}
                                variant="outline"
                            >
                                추가
                            </Button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-primary/80"
                                            disabled={isSubmitting || mutation.isPending}
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {mutation.isError && (
                        <p className="text-destructive text-sm">
                            {mutation.error instanceof Error
                                ? mutation.error.message
                                : "포스트 작성에 실패했습니다"}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || mutation.isPending}
                        className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
                        size="lg"
                    >
                        {isSubmitting || mutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                작성 중...
                            </>
                        ) : (
                            "포스트 작성"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default PostCreateForm;
