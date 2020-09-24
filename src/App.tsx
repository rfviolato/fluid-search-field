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
import { gql, useQuery } from "@apollo/client";
import {
  faBox,
  faUserSlash,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
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
  DialogIcon,
  DialogIconWrapper,
} from "./styled";
import { LazyImage } from "./LazyImage";

const searchSchema = gql`
  query searchUsers($query: String!) {
    search(query: $query, type: USER, first: 10) {
      userCount
      nodes {
        __typename

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
  __typename: string;
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

enum DIALOG_LEVELS {
  DEFAULT = "DEFAULT",
  ERROR = "ERROR",
}

interface IDialogMessage {
  level: DIALOG_LEVELS;
  message: string;
}

/*
 * TODO:
 *  - Error handling
 *
 *  BUGS:
 *  - Type something that will fetch no results, then a little bit after the setTimeout to close it, erase everything.
 *    The box will "wobble" doing what I think that is 2 animations at the same time
 *  - Results' title and username are wobbling on Firefox (also check Safari)
 * */

let dialogTimeout: any;

function App() {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [dialogMessage, setDialogMessage] = useState<IDialogMessage | null>(
    null
  );
  const previousValue = useRef<string>();
  const previousLoadingState = useRef<boolean>();
  const previousResultsLength = useRef<number>(0);
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
    () =>
      results.filter((result) => !!result.name && result.__typename === "User"),
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

  const dismissDialog = useCallback(() => {
    clearTimeout(dialogTimeout);
    setDialogMessage(null);
  }, []);

  const showDialog = useCallback(
    (message: string, level: DIALOG_LEVELS = DIALOG_LEVELS.DEFAULT) => {
      clearTimeout(dialogTimeout);

      setDialogMessage({ level, message });

      return new Promise((resolve) => {
        dialogTimeout = setTimeout(() => {
          dismissDialog();
          resolve();
        }, 2750);
      });
    },
    [dismissDialog]
  );

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
    const hadResults = previousResultsLength.current > 0;
    const wasLoading = previousLoadingState.current;

    if (wasLoading && error) {
      animationControl.start(
        {
          scaleX: 1,
          scaleY: getResultsWrapperScaleValue(1),
        },
        {
          type: "spring",
          stiffness: 40,
          damping: 8,
        }
      );

      showDialog("Shit happened", DIALOG_LEVELS.ERROR).then(() => {
        setTimeout(animateRetract, 300); // waits a bit until dialog element has exited
      });
    } else if (loading && value) {
      // Do the breathing animation
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
    } else if (filteredResults.length && value) {
      // Animate expand to show results
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
    } else if (filteredResults.length === 0 && hadResults && value) {
      animationControl.start(
        {
          scaleX: 1,
          scaleY: getResultsWrapperScaleValue(1),
        },
        {
          type: "spring",
          stiffness: 40,
          damping: 8,
        }
      );

      showDialog("No results found").then(() => {
        setTimeout(animateRetract, 300); // waits a bit until dialog element has exited
      });
    } else if (
      wasLoading &&
      filteredResults.length === 0 &&
      !hadResults &&
      value
    ) {
      animationControl.start(
        {
          scaleX: 1,
          scaleY: getResultsWrapperScaleValue(1),
        },
        {
          type: "spring",
          stiffness: 40,
          damping: 8,
        }
      );

      showDialog("No results found").then(() => {
        setTimeout(animateRetract, 300); // waits a bit until dialog element has exited
      });
    } else if (!value) {
      // Animate retract
      animationControl.start(
        {
          scaleX: 1.03,
          scaleY:
            getResultsWrapperScaleValue(previousResultsLength.current) + 0.05,
        },
        {
          type: "spring",
          stiffness: 40,
          damping: 8,
        }
      );

      // TODO: the interval can be calculated
      setTimeout(animateRetract, 500); // starts a bit before the items exit is done
    }
  }, [
    value,
    loading,
    filteredResults,
    animationControl,
    animateRetract,
    showDialog,
  ]);

  useEffect(() => {
    previousValue.current = value;
    previousResultsLength.current = filteredResults.length;
    previousLoadingState.current = loading;
  }, [value, filteredResults, loading]);

  useEffect(() => {
    dismissDialog();
  }, [value, dismissDialog]);

  const renderDialogIcon = (dialogLevel: DIALOG_LEVELS) => {
    if (dialogLevel === DIALOG_LEVELS.DEFAULT) {
      return <DialogIcon icon={faUserSlash} />;
    }

    if (dialogLevel === DIALOG_LEVELS.ERROR) {
      return <DialogIcon danger icon={faExclamationTriangle} />;
    }

    return null;
  };

  const renderResults = () => {
    const isDanger = dialogMessage?.level === DIALOG_LEVELS.ERROR;

    if (dialogMessage) {
      return (
        <ResultWrapper
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={resultItemVariant}
          custom={1}
        >
          <Result
            href="#"
            target="_blank"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={resultItemAnchorVariant}
            custom={1}
            isLoading={loading}
          >
            <UserInfo>
              <DialogIconWrapper>
                {renderDialogIcon(dialogMessage.level)}
              </DialogIconWrapper>
              <UserName danger={isDanger}>{dialogMessage.message}</UserName>
            </UserInfo>
          </Result>
        </ResultWrapper>
      );
    }

    return filteredResults.map((result, i) => {
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
              <Repositories>{result.repositories.totalCount}</Repositories>
            </UserInfo>
          </Result>
        </ResultWrapper>
      );
    });
  };

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
          <AnimatePresence>{renderResults()}</AnimatePresence>
        </ResultList>
      </Content>
    </Root>
  );
}

export default App;
