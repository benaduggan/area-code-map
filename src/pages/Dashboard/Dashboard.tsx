import { ReactNode, useState } from "react";
import styled from "styled-components";
import { SearchArea } from "../../components/SearchArea/SearchArea";

import { areaCodeList, areaCodeMap } from "../../modules/DataMunge/DataMunge";

const Main = styled.div`
  height: 100vh;
  width: 100vw;

  display: grid;
  grid-template-columns: 400px 1fr;
`;

const LeftSide = styled.div`
  height: 100%;
  border-right: 1px black solid;

  display: grid;
  justify-items: center;
  grid-template-rows: auto 1fr;
`;

const Content = styled.div`
  height: 100%;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
`;

export const Dashboard = () => {
  const [query, setQuery] = useState("");

  console.log(areaCodeMap["704"]);

  return (
    <Main>
      <LeftSide>
        <SearchArea query={query} setQuery={(e) => setQuery(e.target.value)} />
        <ResultsList>
          <p>Search Results</p>
          {areaCodeList
            .filter(({ NPA }) => NPA.includes(query))
            .map((areaCode, idx) => (
              <p key={idx} onClick={() => console.log(areaCode)}>
                {areaCode.NPA} - {areaCode.STATE} - {areaCode.COUNTRY}
              </p>
            ))}
        </ResultsList>
      </LeftSide>
      <Content>Put the map here</Content>
    </Main>
  );
};
