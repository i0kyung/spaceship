// vite.config.ts의 base(GitHub Pages 배포용 '/spaceship/')가 바뀌어도 깨지지 않도록
// public/media 경로를 항상 BASE_URL 기준 상대 경로로 만든다.
export function mediaUrl(file: string): string {
  return `${import.meta.env.BASE_URL}media/${file}`
}
