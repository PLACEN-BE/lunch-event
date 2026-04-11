import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'lunch_user_id'

export async function updateSession(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE)?.value

  if (
    !userId &&
    !request.nextUrl.pathname.startsWith('/login')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
