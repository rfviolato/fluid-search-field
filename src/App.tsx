import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";

const DIMENSIONS = {
  INPUT: {
    INITIAL_WIDTH: 400,
    INITIAL_HEIGHT: 75,
  },
};

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
  background: cornflowerblue;
  font-size: 24px;
  font-family: sans-serif;
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
function createAnimateAttribute(isLoading: boolean) {
  if (isLoading) {
    return { scale: [1, 1.03, 1] };
  }

  return {};
}

function createTransitionAttribute(isLoading: boolean) {
  if (isLoading) {
    return {
      times: [0, 0.5, 1],
      duration: 2,
      loop: true,
      yoyo: Infinity,
      ease: "easeInOut",
    };
  }
}

function App() {
  const [isLoading, setLoading] = useState(false);
  const onSearch = () => {
    setLoading(true);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => setLoading(false), 1500);
  };
  const debouncedOnChange = useMemo(() => debounce(onSearch, 400), []);

  console.log({ isLoading });

  return (
    <Root>
      <Content>
        <SearchFieldWrapper
          animate={createAnimateAttribute(isLoading)}
          transition={createTransitionAttribute(isLoading)}
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
