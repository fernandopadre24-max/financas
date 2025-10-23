
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // A verificação de cookies e redirecionamentos foi removida
  // para simplificar e evitar conflitos com o fluxo de autenticação
  // gerenciado no lado do cliente pelo Firebase.
  // A proteção de rotas agora é feita pelo AuthGuard no app-layout.
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
