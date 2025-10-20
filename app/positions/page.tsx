import Link from 'next/link';

export default function Positions() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--venom-base-dark)' }}>
      <div className="text-center px-4">
        <h1 
          className="text-6xl font-bold mb-6"
          style={{ color: 'var(--venom-green-primary)' }}
        >
          Positions
        </h1>
        <p className="text-2xl text-gray-400 mb-8">
          Coming Soon
        </p>
        <p className="text-gray-500 mb-12 max-w-md mx-auto">
          Real-time position monitoring with advanced risk management tools are under development.
        </p>
        <Link 
          href="/"
          className="inline-block px-8 py-3 rounded-lg transition-all duration-300"
          style={{
            background: 'var(--venom-green-primary)',
            color: 'var(--venom-base-dark)',
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
