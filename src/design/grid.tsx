import styled from 'styled-components';

interface RowProps {
  gap?: string;
}

interface ColProps {
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export const Row = styled.div<RowProps>`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: ${({ theme, gap = theme.spacing(2) }) => gap};
`;

export const Col = styled.div<ColProps>`
  grid-column: span ${({ colSpan = 12 }) => colSpan};
  min-width: 0;
`;
