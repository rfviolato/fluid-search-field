import React, { useState } from "react";
import styled from "@emotion/styled";
import { motion } from "framer-motion";

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

const SearchFieldWrapper = styled(motion.div)`
  width: 400px;
  height: 75px;
  border-radius: 7px;
  background-color: #fff;
`;

const SearchField = styled.input`
  border: 0;
  outline: 0;
  width: 100%;
  height: 75px;
  font-size: 30px;
  padding: 0 16px;
  background-color: transparent;

  &::placeholder {
    font-size: 0.8em;
    opacity: 0.6;
    font-style: italic;
  }
`;

const variants = {
  collapsed: {
    height: 75,
  },
  expanded: {
    height: 300,
  },
};

function App() {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <Root onClick={() => setExpanded(!isExpanded)}>
      <SearchFieldWrapper
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={variants}
      >
        <SearchField type="text" placeholder="type something..." />
      </SearchFieldWrapper>
    </Root>
  );
}

export default App;
