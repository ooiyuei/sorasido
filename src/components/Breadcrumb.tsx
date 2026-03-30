import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4" aria-label="パンくずリスト">
      <Link href="/" className="hover:text-violet-600 transition-colors">
        ホーム
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          <span className="text-gray-300">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-violet-600 transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-600 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
