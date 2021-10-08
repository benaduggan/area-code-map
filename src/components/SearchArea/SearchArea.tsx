import styled from "styled-components";

const StyledInput = styled.input`
  width: 60%;
  margin: 5px;
`;

export const SearchArea = ({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <StyledInput
      type="text"
      placeholder="Search for area code here"
      value={query}
      onChange={setQuery}
    />
  );
};
