
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lista de rotas públicas que não exigem autenticação
  const publicRoutes = ['/login', '/signup'];

  // Verifica se a rota acessada é pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verifica o cookie de autenticação do Firebase
  // O nome do cookie pode variar dependendo da sua configuração, 
  // mas __session é um padrão comum com session cookies.
  // Adapte se estiver usando um nome de cookie diferente.
  const sessionCookie = request.cookies.get('__session');

  // Se não houver cookie e a rota não for pública, redireciona para o login
  if (!sessionCookie && !publicRoutes.includes(pathname)) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Se o usuário estiver logado e tentar acessar login/signup, redireciona para a home
  if (sessionCookie && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configuração do matcher para definir quais rotas o middleware deve analisar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
