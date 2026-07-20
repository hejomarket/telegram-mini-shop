'use client';

import { useTelegram } from '../../providers/TelegramProvider';

export function TelegramDebugPanel() {
  const { debugInfo } = useTelegram();
  const rows = [
    ['Platform', debugInfo.platform], ['Version', debugInfo.version], ['Color Scheme', debugInfo.colorScheme],
    ['Viewport Height', debugInfo.viewportHeight], ['Viewport Stable Height', debugInfo.viewportStableHeight],
    ['Is Expanded', debugInfo.isExpanded], ['Is Fullscreen', debugInfo.isFullscreen], ['Language', debugInfo.language],
    ['Theme', debugInfo.theme], ['Init Data Exists', debugInfo.initDataExists], ['User Exists', debugInfo.userExists],
  ];

  return (
    <details className="mb-10 rounded-[1.4rem] bg-white/70 p-4 text-sm text-soia-green ring-1 ring-soia-green/10">
      <summary className="cursor-pointer font-black">Developer Telegram Debug</summary>
      <dl className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[9rem_1fr] gap-2 border-t border-soia-green/10 pt-2">
            <dt className="font-bold text-soia-green/65">{label}</dt>
            <dd className="break-words font-mono text-xs whitespace-pre-wrap">{value || '-'}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
