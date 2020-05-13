import React, { useEffect, useMemo, useState } from "react";
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
    opacity: 0.6;
    font-style: italic;
  }
`;

let timeout: any;
function getAnimate(isLoading: boolean, results: string[]) {
  if (isLoading) {
    return "breathing";
  }

  if (results.length) {
    return "expanded";
  }

  return "";
}

// TODO: Check if it is possible to maybe specify a different transition for each variant in one single object
function getTransition(isLoading: boolean, results: string[]) {
  if (isLoading) {
    return {
      duration: 0.9,
      yoyo: Infinity,
      ease: "easeInOut",
    };
  }

  if (results.length) {
    return {
      duration: 0.6,
      ease: "easeInOut",
    };
  }

  return {};
}

function App() {
  /**
   * TODO: Polish "expanded" animation easing & timing
   */
  const [isLoading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const animationControl = useAnimation();
  const onSearch = () => {
    setLoading(true);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      setResults(["Address 1", "Address 2", "Address 3"]);
      setLoading(false);
    }, 2000);
  };
  const debouncedOnChange = useMemo(() => debounce(onSearch, 400), []);

  useEffect(() => {
    if (isLoading) {
      animationControl.start("breathing");
    }

    if (results.length) {
      animationControl.stop();
      animationControl.start("expanded");
    }
  }, [isLoading, results]);

  console.log({ isLoading, getAnimate: getAnimate(isLoading, results) });

  return (
    <Root>
      <Content>
        <SearchFieldWrapper
          variants={{
            breathing: {
              scale: 1.03,
            },
            expanded: {
              scaleX: 1.03,
              scaleY: 5,
            },
          }}
          transition={getTransition(isLoading, results)}
          animate={animationControl}
        />
        <SearchField
          type="text"
          placeholder="type something..."
          onChange={() => debouncedOnChange()}
        />
      </Content>
    </Root>
  );
}

export default App;
