import styled from 'styled-components';

const Card = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.round};
  box-sizing: border-box;
  min-width: 0;
  padding: ${({ theme }) =>
    `clamp(${theme.spacing(2)}, 3vw, ${theme.spacing(3)})`};
  box-shadow: ${({ theme }) => theme.boxShadow.md};
  overflow-x: auto;

  & > :first-child {
    margin-block-start: 0;
  }

  & > :last-child {
    margin-block-end: 0;
  }
`;

export default Card;
