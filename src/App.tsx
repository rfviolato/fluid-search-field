import React from 'react';
import styled from '@emotion/styled';

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #fff;
  background: cornflowerblue;
  font-size: 24px;
`;

function App() {
  return (
    <Root className="App">
      This is my app!
    </Root>
  );
}

export default App;
