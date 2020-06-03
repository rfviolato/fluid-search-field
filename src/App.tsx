import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import styled from "@emotion/styled";
import { motion, useAnimation } from "framer-motion";
import debounce from "lodash.debounce";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";

const searchSchema = gql`
  query searchUsers($query: String!) {
    search(query: $query, type: USER, first: 10) {
      userCount
      nodes {
        ... on User {
          avatarUrl
          name
          url
          login
        }
      }
    }
  }
`;

const DIMENSIONS = {
  INPUT: {
    INITIAL_WIDTH: 400,
    INITIAL_HEIGHT: 75,
  },
};

const Root = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
  color: #fff;
  background: cornflowerblue;
  font-size: 24px;
  font-family: sans-serif;
  padding-top: 20%;

  * {
    box-sizing: border-box;
  }
`;

const Content = styled.div`
  position: relative;
`;

const SearchFieldWrapper = styled(motion.div)`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: ${DIMENSIONS.INPUT.INITIAL_WIDTH}px;
  height: ${DIMENSIONS.INPUT.INITIAL_HEIGHT}px;
  background-color: #fff;
  transform-origin: top center;
`;

const SearchField = styled.input`
  position: relative;
  border: 0;
  outline: 0;
  width: ${DIMENSIONS.INPUT.INITIAL_WIDTH}px;
  height: ${DIMENSIONS.INPUT.INITIAL_HEIGHT}px;
  font-size: 30px;
  padding: 0 16px;
  background-color: transparent;
  z-index: 2;

  &::placeholder {
    font-size: 0.8em;
    opacity: 0.7;
    font-style: italic;
    transition: opacity 200ms ease;
  }

  &:focus::placeholder {
    opacity: 0.4;
  }
`;

const ResultList = styled.ul`
  position: relative;
  z-index: 2;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 300px;
  overflow: auto;
`;

const Result = styled.li`
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  margin: 0;
  color: #000;
`;

const UserAvatar = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  border: 2px solid #333;
`;

const UserName = styled.span`
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  font-weight: bold;
`;

const UserLogin = styled.span`
  display: inline-block;
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.6;
`;

interface IQueryResultUser {
  avatarUrl: string;
  name: string | null;
  url: string;
  login: string;
}

interface ISearchQueryResult {
  search: {
    userCount: number;
    nodes: IQueryResultUser[];
  };
}

function App() {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const { loading, data, error } = useQuery<ISearchQueryResult>(searchSchema, {
    variables: { query },
    skip: !query,
  });
  const animationControl = useAnimation();
  const onSearch = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => setQuery(value),
    [setQuery]
  );
  const results = data ? data.search.nodes : [];

  const animateRetract = useCallback(() => {
    return animationControl.start(
      {
        scaleY: 1,
        scaleX: 1,
      },
      {
        duration: 0.3,
        type: "spring",
        mass: 1,
        tension: 5,
        stiffness: 40,
      }
    );
  }, [animationControl]);

  const debouncedSearch = useMemo(() => {
    const debounced = debounce(onSearch, 400);

    return (event: ChangeEvent<HTMLInputElement>) => {
      event.persist();

      return debounced(event);
    };
  }, [onSearch]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);

    debouncedSearch(event);
  };

  useEffect(() => {
    if (loading) {
      (async function () {
        if (results && results.length) {
          await animateRetract();
        }

        return animationControl.start(
          {
            scaleY: 1.03,
            scaleX: 1.03,
          },
          {
            duration: 0.9,
            yoyo: Infinity,
            ease: "easeInOut",
            type: "tween",
          }
        );
      })();
    } else if (results && results.length) {
      animationControl.start(
        {
          scaleX: 1,
          scaleY: 5,
        },
        {
          duration: 0.6,
          type: "spring",
        }
      );
    }
  }, [loading, results, animationControl, animateRetract]);

  useEffect(() => {
    if (!value) {
      animateRetract();
    }
  }, [value, animateRetract]);

  console.log({ loading, data, error });

  return (
    <Root>
      <Content>
        <SearchFieldWrapper animate={animationControl} />
        <SearchField
          type="text"
          placeholder="type something..."
          onChange={onChange}
        />
        <ResultList>
          {results.map((result) => {
            const { name } = result;

            if (name) {
              return (
                <Result>
                  <UserAvatar src={result.avatarUrl} alt={name} />
                  <UserName>{name}</UserName>
                  <UserLogin>@{result.login}</UserLogin>
                </Result>
              );
            }

            return null;
          })}
        </ResultList>
      </Content>
    </Root>
  );
}

export default App;
