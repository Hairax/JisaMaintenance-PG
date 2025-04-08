type Props = { className?: string };

export const BottomNav = ({ className }: Props) => (
  <nav
    className={`${className} fixed bottom-0 left-0 w-full bg-white shadow-md z-50`}
  >
    <ul className="flex justify-around text-sm py-2">
      <li>
        <a href="/" className="flex flex-col items-center text-gray-700">
          <span>🏠</span>Inicio
        </a>
      </li>
      <li>
        <a
          href="/dashboard"
          className="flex flex-col items-center text-gray-700"
        >
          <span>📊</span>Dashboard
        </a>
      </li>
    </ul>
  </nav>
);
