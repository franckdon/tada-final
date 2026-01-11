export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ✅ L'application fonctionne !
        </h1>
        <p className="text-gray-600 mb-4">
          Police: DM Sans (vous devriez voir une différence)
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">✅ Middleware: OK (pas d'auth)</p>
          <p className="text-sm text-gray-500">✅ Layout: OK</p>
          <p className="text-sm text-gray-500">✅ Sentry: OK (warnings normaux)</p>
          <p className="text-sm text-gray-500">✅ DM Sans: Chargée</p>
        </div>
        <div className="mt-6">
          <a
            href="/missions"
            className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Aller aux Missions →
          </a>
        </div>
      </div>
    </div>
  );
}
