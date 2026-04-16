import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'lunch_user_id'

export async function updateSession(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE)?.value

  const publicPaths = ['/login', '/pick', '/fortune', '/api']
  const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p))

  if (!userId && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
