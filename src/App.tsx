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

let timeout: any;

function App() {
  const [isLoading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const animationControl = useAnimation();
  const onSearch = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      if (value) {
        setLoading(true);

        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          setResults(["Address 1", "Address 2", "Address 3"]);
          setLoading(false);
        }, 3000);
      }
    },
    [setLoading, setResults]
  );

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
    if (isLoading) {
      (async function () {
        if (results) {
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
    } else if (results.length) {
      animationControl.start(
        {
          scaleX: 1.03,
          scaleY: 5,
        },
        {
          duration: 0.6,
          type: "spring",
        }
      );
    }
  }, [isLoading, results, animationControl]);

  useEffect(() => {
    if (!value) {
      animateRetract();
    }
  }, [value, animateRetract]);

  return (
    <Root>
      <Content>
        <SearchFieldWrapper animate={animationControl} />
        <SearchField
          type="text"
          placeholder="type something..."
          onChange={onChange}
        />
      </Content>
    </Root>
  );
}

export default App;
