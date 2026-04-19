'use client';

const rayPaths = [
  'M3 46L33 38L3 30L0 38L3 46Z',
  'M3.59808 27.3555L33.5788 35.4273L11.5981 13.4991L5 18.9273L3.59808 27.3555Z',
  'M13.5 11.5981L35.4282 33.5788L27.3564 3.59808L18.9282 5L13.5 11.5981Z',
  'M30 3L38 33L46 3L38 0L30 3Z',
  'M49 3.59808L40.9282 33.5788L62.8564 11.5981L57.4282 5L49 3.59808Z',
  'M64.981 13.5L43.0003 35.4282L72.981 27.3564L71.5791 18.9282L64.981 13.5Z',
  'M74 30L44 38L74 46L77 38L74 30Z',
];

const rayColors = ['#00AEEF', '#8DC63F', '#FFF200', '#F7941D', '#ED1C24', '#E5007D', '#662D91'];

interface Props {
  size?: number;
}

export function ArkaMiniLogo({ size = 32 }: Props) {
  return <ArkaLogo size={size} />;
}

export default function ArkaLogo({ size = 32 }: Props) {
  const viewBox = '0 0 77 46';
  return (
    <svg width={size} height={size * (46 / 77)} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg">
      {rayPaths.map((d, i) => (
        <path key={i} d={d} fill={rayColors[i]} fillRule="evenodd" />
      ))}
    </svg>
  );
}
