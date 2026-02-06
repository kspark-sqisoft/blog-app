"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const getPosts = async () => {
    const posts = await prisma.post.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });
    return posts;
};

// ============================================
// 포스트 개수 조회
// ============================================
// 등록된 전체 포스트 개수를 반환합니다.
export const getPostsCount = async () => {
    const count = await prisma.post.count();
    return count;
};

// ============================================
// 페이지네이션된 포스트 조회
// ============================================
// 무한 스크롤을 위한 페이지네이션 함수
// - limit: 한 번에 가져올 포스트 수
// - cursor: 마지막 포스트의 ID (다음 페이지를 가져오기 위한 커서)
// - searchQuery: 검색어 (제목, 내용, 태그로 검색)
export const getPostsPaginated = async ({
    limit = 5,
    cursor,
    searchQuery,
}: {
    limit?: number;
    cursor?: number;
    searchQuery?: string;
}) => {
    // 검색 조건 구성
    const where = searchQuery
        ? {
              OR: [
                  { title: { contains: searchQuery, mode: "insensitive" as const } },
                  { content: { contains: searchQuery, mode: "insensitive" as const } },
                  {
                      tags: {
                          some: {
                              tag: {
                                  name: { contains: searchQuery, mode: "insensitive" as const },
                              },
                          },
                      },
                  },
              ],
          }
        : undefined;

    const posts = await prisma.post.findMany({
        take: limit + 1, // 한 개 더 가져와서 다음 페이지 존재 여부 확인
        skip: cursor ? 1 : 0, // cursor가 있으면 첫 번째 항목 스킵
        cursor: cursor ? { id: cursor } : undefined,
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
        orderBy: {
            id: "desc",
        },
    });

    // 다음 페이지 존재 여부 확인
    const hasNextPage = posts.length > limit;
    const items = hasNextPage ? posts.slice(0, limit) : posts;

    return {
        items,
        nextCursor: hasNextPage ? items[items.length - 1].id : undefined,
        hasNextPage,
    };
};

export const createPost = async (
    title: string,
    content: string,
    tagNames: string[] = []
) => {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("로그인이 필요합니다.");
    }

    const userId = parseInt(session.user.id);

    // 태그 생성 또는 찾기
    const tagConnections = await Promise.all(
        tagNames.map(async (tagName) => {
            const trimmedName = tagName.trim();
            if (!trimmedName) return null;

            // 태그가 이미 존재하는지 확인
            let tag = await prisma.tag.findUnique({
                where: { name: trimmedName },
            });

            // 태그가 없으면 생성
            if (!tag) {
                tag = await prisma.tag.create({
                    data: { name: trimmedName },
                });
            }

            return { tagId: tag.id };
        })
    );

    // null 값 제거
    const validTagConnections = tagConnections.filter(
        (conn): conn is { tagId: number } => conn !== null
    );

    const newPost = await prisma.post.create({
        data: {
            title,
            content,
            userId,
            tags: {
                create: validTagConnections.map((conn) => ({
                    tagId: conn.tagId,
                })),
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    return newPost;
};

export const getPost = async (id: number) => {
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    if (!post) {
        throw new Error("포스트를 찾을 수 없습니다.");
    }

    return post;
};

export const updatePost = async (
    id: number,
    title: string,
    content: string,
    tagNames: string[] = []
) => {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("로그인이 필요합니다.");
    }

    const userId = parseInt(session.user.id);

    // 본인의 포스트만 수정 가능
    const post = await prisma.post.findUnique({
        where: { id },
    });

    if (!post) {
        throw new Error("포스트를 찾을 수 없습니다.");
    }

    if (post.userId !== userId) {
        throw new Error("본인의 포스트만 수정할 수 있습니다.");
    }

    // 기존 태그 연결 삭제
    await prisma.postTag.deleteMany({
        where: { postId: id },
    });

    // 새 태그 생성 또는 찾기
    const tagConnections = await Promise.all(
        tagNames.map(async (tagName) => {
            const trimmedName = tagName.trim();
            if (!trimmedName) return null;

            let tag = await prisma.tag.findUnique({
                where: { name: trimmedName },
            });

            if (!tag) {
                tag = await prisma.tag.create({
                    data: { name: trimmedName },
                });
            }

            return { tagId: tag.id };
        })
    );

    const validTagConnections = tagConnections.filter(
        (conn): conn is { tagId: number } => conn !== null
    );

    // 포스트 업데이트
    const updatedPost = await prisma.post.update({
        where: { id },
        data: {
            title,
            content,
            tags: {
                create: validTagConnections.map((conn) => ({
                    tagId: conn.tagId,
                })),
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
        },
    });

    return updatedPost;
};

export const deletePost = async (id: number) => {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("로그인이 필요합니다.");
    }

    const userId = parseInt(session.user.id);

    // 본인의 포스트만 삭제 가능
    const post = await prisma.post.findUnique({
        where: { id },
    });

    if (!post) {
        throw new Error("포스트를 찾을 수 없습니다.");
    }

    if (post.userId !== userId) {
        throw new Error("본인의 포스트만 삭제할 수 있습니다.");
    }

    await prisma.post.delete({
        where: { id },
    });

    return { success: true };
};
