import React from "react";
import styled from "styled-components";

export interface returnProps {
  file: string;
  index: number;
  comments: string[];
  functionName: string;
}

interface IndivContentProps {
  fileName: string;
  funcName: string;
  funcDescription: string;
  parameters: Array<{
    type?: string;
    paramName: string;
    paramDescription: string;
  }>;
  returns: {
    type?: string;
    description: string;
  };
}

const App = ({ json }: { json: returnProps[] }) => {
  return (
    <SDiv>
      {json.map(({ file, comments, functionName }) => {
        const parsedArr = comments[0]
          .split("*")
          .slice(3, -1)
          .map((x) => x.trim())
          .filter((x) => x !== "");
        const parameters = parsedArr
          .filter((x) => x.startsWith("@param"))
          .map((v) => {
            const type = v.split("{")[1].split("}")[0];
            const paramName = v.split(" ")[2];
            const paramDescription = v.split(" ").slice(3).join(" ");
            return {
              type,
              paramName,
              paramDescription,
            };
          });
        const returns = parsedArr.filter((x) => x.startsWith("@return"))[0];
        const returnsDescription = returns
          ? returns.split(" ").slice(1).join(" ")
          : null;
        return (
          <section key={file}>
            <h1>{file}</h1>
            <article>
              <h2>{functionName}</h2>
              {parameters.length > 0 && <p>Parameters</p>}
              {parameters.map(({ type, paramName, paramDescription }) => {
                return (
                  <SIndivParam key={paramName}>
                    <SType>{type}</SType>
                    <span>{paramName}</span>
                    <span>{paramDescription}</span>
                  </SIndivParam>
                );
              })}
              {returnsDescription && (
                <>
                  <p>Returns</p>
                  <SIndivParam>
                    <span>{returnsDescription}</span>
                  </SIndivParam>
                </>
              )}
            </article>
          </section>
        );
      })}
    </SDiv>
  );
};

export default App;

const SDiv = styled.div`
  section {
    border-radius: 1rem;
    border: 1px solid #808080;
    padding: 1rem;
    margin: 1rem;

    article {
      background-color: #d9d9d9;
      border-radius: 20px;
      padding: 1rem;
    }
    h1 {
      margin: 0;
      margin-bottom: 1rem;
    }
    h2 {
      margin: 0;
      margin-bottom: 1rem;
    }
  }
`;

const SType = styled.span`
  background: #ffe6c070;
  color: #bc8700;
  padding: 0.1rem 0.4rem;
`;

const SIndivParam = styled.div`
  margin-left: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;

  span {
    margin: 0.2rem;
  }
`;
