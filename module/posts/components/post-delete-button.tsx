"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePost } from "../actions/post.action";

type PostDeleteButtonProps = {
    postId: number;
};

const PostDeleteButton = ({ postId }: PostDeleteButtonProps) => {
    const queryClient = useQueryClient();
    const router = useRouter();

    const deleteMutation = useMutation({
        mutationFn: deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            toast.success("포스트가 삭제되었습니다");
            router.push("/posts");
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : "포스트 삭제에 실패했습니다");
        },
    });

    const handleDelete = () => {
        if (confirm("정말 이 포스트를 삭제하시겠습니까?")) {
            deleteMutation.mutate(postId);
        }
    };

    return (
        <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
        >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
        </Button>
    );
};

export default PostDeleteButton;
