import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAnimation, Variants, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import {
  Content,
  DIMENSIONS,
  Repositories,
  RepositoriesIcon,
  Result,
  ResultList,
  ResultWrapper,
  Root,
  SearchField,
  SearchFieldWrapper,
  UserAvatar,
  UserInfo,
  UserLogin,
  UserName,
} from "./styled";

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
          repositories {
            totalCount
          }
        }
      }
    }
  }
`;

function getResultsWrapperScaleValue(
  numberOfResults: number,
  maxResultsDisplayed: number = 5
): number {
  const initialHeight = DIMENSIONS.INPUT.INITIAL_HEIGHT;
  const resultHeight = DIMENSIONS.RESULT.HEIGHT + DIMENSIONS.RESULT.BORDER; // border;
  const resultsToMeasure =
    numberOfResults > maxResultsDisplayed
      ? maxResultsDisplayed
      : numberOfResults;
  const targetHeight = initialHeight + resultsToMeasure * resultHeight;

  return targetHeight / initialHeight;
}

const resultItemVariant: Variants = {
  visible: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.15,
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
    },
  }),
  hidden: {
    opacity: 0,
    transition: {
      easing: "cubic-bezier(0.33, 1, 0.68, 1)",
    },
  },
};

const resultItemAnchorVariant: Variants = {
  visible: (i: number) => ({
    y: 0,
    transition: {
      type: "spring",
      delay: i * 0.15,
    },
  }),
  hidden: {
    y: -3,
  },
};

interface IQueryResultUser {
  avatarUrl: string;
  name: string | null;
  url: string;
  login: string;
  repositories: {
    totalCount: number;
  };
}

interface ISearchQueryResult {
  search: {
    userCount: number;
    nodes: IQueryResultUser[];
  };
}

/*
 * TODO:
 *  - Handle less than 5 results
 *  - Show "no results found" indicator
 *  - Image pre-loading
 *
 *  BUGS:
 *  - Type something, wait for results, erase everything and after reaching value.length === 0, start typing again,
 *    The component will animate retract, but that's undesired
 *  - Handle weird search terms that produce API errors
 * */

function App() {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const oldValue = useRef<string>();
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
        type: "spring",
        mass: 0.6,
        damping: 13,
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
      animationControl.start(
        {
          scaleY: results.length ? 5.03 : 1.03,
          scaleX: 1.03,
        },
        {
          duration: 0.8,
          yoyo: Infinity,
          ease: "easeInOut",
          type: "tween",
        }
      );
    } else if (results.length) {
      animationControl.start(
        {
          scaleX: 1,
          scaleY: getResultsWrapperScaleValue(results.length),
        },
        {
          type: "spring",
          mass: 0.8,
          damping: 13,
        }
      );
    }
  }, [loading, results, animationControl, animateRetract]);

  useEffect(() => {
    if (!value && oldValue.current) {
      (async function () {
        await animationControl.start(
          {
            scaleX: 1.03,
            scaleY: 5.05,
          },
          {
            type: "spring",
            stiffness: 40,
            damping: 8,
          }
        );

        await animateRetract();
      })();
    }

    oldValue.current = value;
  }, [oldValue, value, animateRetract, animationControl]);

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
          <AnimatePresence>
            {results.map((result, i) => {
              const { name } = result;

              if (name) {
                return (
                  <ResultWrapper
                    key={result.login}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={resultItemVariant}
                    custom={i}
                  >
                    <Result
                      href={result.url}
                      target="_blank"
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={resultItemAnchorVariant}
                      custom={i}
                      isLoading={loading}
                    >
                      <UserInfo>
                        <UserAvatar src={result.avatarUrl} alt={name} />
                        <UserName>{name}</UserName>
                        <UserLogin>@{result.login}</UserLogin>
                      </UserInfo>

                      <UserInfo>
                        <RepositoriesIcon icon={faBox} />
                        <Repositories>
                          {result.repositories.totalCount}
                        </Repositories>
                      </UserInfo>
                    </Result>
                  </ResultWrapper>
                );
              }

              return null;
            })}
          </AnimatePresence>
        </ResultList>
      </Content>
    </Root>
  );
}

export default App;
