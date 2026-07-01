import Skeleton from './Skeleton';

/**
 * Skeleton row for admin tables.
 * @param {Object} props
 * @param {number} [props.columns=5] - Number of columns to render
 * @param {number} [props.rows=8] - Number of rows to render
 */
export default function TableRowSkeleton({ columns = 5, rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }, (_, colIdx) => (
            <td key={colIdx} style={{ padding: '0.75rem 1rem' }}>
              <Skeleton
                width={colIdx === 0 ? '70%' : '60%'}
                height="0.875rem"
                borderRadius="0.25rem"
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
