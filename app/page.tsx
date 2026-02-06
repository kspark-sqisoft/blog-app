// ============================================
// 홈 페이지
// ============================================
// 루트 경로(/)에서 /posts로 리다이렉트하는 대신
// PostsPage 컴포넌트를 직접 렌더링하여 흰 화면을 방지합니다.
// redirect()를 사용하면 리다이렉트가 발생하는 동안 흰 화면이 보일 수 있습니다.

import PostsPage from "./posts/page";

export default function Home() {
  return <PostsPage />;
}
