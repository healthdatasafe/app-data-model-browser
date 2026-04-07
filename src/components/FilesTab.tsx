import { useEffect, useState } from 'react';
import type { HDSModel } from 'hds-lib';

interface FileEntry {
  title: string;
  file: string;
}

interface VersionJson {
  publicationDate?: string;
  commit?: string;
  commitShort?: string;
  branch?: string;
  buildDate?: string;
  files?: FileEntry[];
}

interface FilesTabProps {
  model: HDSModel;
}

/**
 * Lists all data-model files published alongside pack.json. Equivalent to the
 * "files" section of the old static `model.datasafe.dev/index.html`.
 *
 * Source of truth: `version.json` produced by `data-model/src/build.js`. The
 * URL is derived from the loaded `modelUrl` (replace the trailing filename
 * with `version.json`).
 */
export function FilesTab ({ model }: FilesTabProps) {
  const [version, setVersion] = useState<VersionJson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const baseUrl = model.modelUrl.replace(/\/[^/]*$/, '/');
    const versionUrl = baseUrl + 'version.json';
    fetch(versionUrl)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((v: VersionJson) => setVersion(v))
      .catch((e: Error) => setError(e.message));
  }, [model]);

  if (error) {
    return <div className='p-6 text-sm text-destructive'>Failed to load version.json: {error}</div>;
  }
  if (!version) {
    return <div className='p-6 text-sm text-muted-foreground'>Loading…</div>;
  }

  const baseUrl = model.modelUrl.replace(/\/[^/]*$/, '/');
  const files = version.files ?? [];

  return (
    <div className='p-4 max-w-3xl'>
      <div className='border border-border bg-card text-card-foreground rounded-lg p-4'>
        <div className='mb-4'>
          <h2 className='text-lg font-bold'>Published files</h2>
          <div className='text-xs text-muted-foreground mt-0.5 space-y-0.5'>
            {version.publicationDate && (
              <div>publication: {new Date(version.publicationDate).toLocaleString()}</div>
            )}
            {version.commitShort && (
              <div>commit: <span className='font-mono'>{version.commitShort}</span> on {version.branch}</div>
            )}
            {version.buildDate && (
              <div>built: {new Date(version.buildDate).toLocaleString()}</div>
            )}
          </div>
        </div>

        {files.length === 0 && (
          <div className='text-sm text-muted-foreground italic'>
            No <span className='font-mono'>files</span> entry in <span className='font-mono'>version.json</span>.
            (Requires data-model build with the files-index addition.)
          </div>
        )}

        {files.length > 0 && (
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground'>
                <th className='py-2 font-semibold'>Title</th>
                <th className='py-2 font-semibold'>File</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.file} className='border-b border-border/50'>
                  <td className='py-2 pr-4'>{f.title}</td>
                  <td className='py-2'>
                    <a
                      href={baseUrl + f.file}
                      target='_blank'
                      rel='noreferrer'
                      className='font-mono text-primary hover:underline break-all'
                    >
                      {f.file}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
