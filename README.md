bun create next-app@latest blog-app --yes

bunx --bun shadcn@latest init

bunx --bun shadcn@latest add --all

bun add -d prisma tsx @types/pg  
bun add @prisma/client @prisma/adapter-pg dotenv pg

bunx prisma init
#prisma 폴더 생성 sehema.prisma 생성

.env DATABASE_URL 설정

스키마 정의

bunx prisma migrate dev --name 스키마 기반 태이블 생성

bunx prisma generate

#Prisma Client 생성
lib/generated/prisma/ 에 저장됨

lib/prisma.ts 생성

bun add zod

bun add @tanstack/react-query
