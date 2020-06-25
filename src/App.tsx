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
  DIMENSIONS,
  Content,
  Repositories,
  RepositoriesIcon,
  Result,
  ResultList,
  ResultWrapper,
  Root,
  SearchField,
  SearchFieldWrapper,
  UserInfo,
  UserLogin,
  UserName,
} from "./styled";
import { LazyImage } from "./LazyImage";

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
      delay: (i + 1) * 0.15,
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
 *  - Show "no results found" indicator
 *  - Error handling
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
  const oldResultsLength = useRef<number>(0);
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
  const filteredResults = useMemo(
    () => results.filter((result) => !!result.name),
    [results]
  );

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
    const { current: previousResultsLength } = oldResultsLength;

    if (loading) {
      const scaleIncrease = 0.03;
      const scaleY =
        getResultsWrapperScaleValue(filteredResults.length) + scaleIncrease;

      animationControl.start(
        {
          scaleY,
          scaleX: 1.03,
        },
        {
          duration: 0.8,
          yoyo: Infinity,
          ease: "easeInOut",
          type: "tween",
        }
      );
    } else if (filteredResults.length) {
      animationControl.start(
        {
          scaleX: 1,
          scaleY: getResultsWrapperScaleValue(filteredResults.length),
        },
        {
          type: "spring",
          mass: 0.8,
          damping: 13,
        }
      );
    } else if (filteredResults.length === 0 && previousResultsLength > 0) {
      const scaleX = 1.03;
      const scaleY = getResultsWrapperScaleValue(previousResultsLength) + 0.05;

      animationControl.start(
        {
          scaleX,
          scaleY,
        },
        {
          type: "spring",
          stiffness: 40,
          damping: 8,
        }
      );

      setTimeout(animateRetract, 300);
    }
  }, [loading, filteredResults, animationControl, animateRetract]);

  useEffect(() => {
    oldValue.current = value;
    oldResultsLength.current = filteredResults.length;
  }, [value, filteredResults]);

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
            {filteredResults.map((result, i) => {
              const { name } = result;

              return (
                <ResultWrapper
                  key={`${result.login}${i}`}
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
                      <LazyImage
                        width={DIMENSIONS.AVATAR.SIZE}
                        height={DIMENSIONS.AVATAR.SIZE}
                        src={result.avatarUrl}
                        alt={name || "User avatar"}
                      />
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
            })}
          </AnimatePresence>
        </ResultList>
      </Content>
    </Root>
  );
}

export default App;
