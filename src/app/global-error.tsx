"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-[#f5f2ed] p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#b22234] to-[#006233] rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">AC</span>
          </div>
          <h1 className="text-xl font-bold text-[#1a1a2e]">Erreur de chargement</h1>
          <p className="text-sm text-[#6b7280]">
            Une erreur s&apos;est produite lors du chargement de la page.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-lg font-medium px-6 py-3 text-sm bg-gradient-to-r from-[#b22234] to-[#8b1a1e] text-white shadow-sm hover:shadow-md cursor-pointer"
          >
            Réessayer
          </button>
          <p className="text-[10px] text-[#9ca3af] pt-2 border-t border-[#e5e0d8]">
            Responsable : ANASS GUERRABI
          </p>
        </div>
      </body>
    </html>
  )
}
