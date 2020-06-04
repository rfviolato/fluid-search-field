import styled from "@emotion/styled";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const DIMENSIONS = {
  INPUT: {
    INITIAL_WIDTH: 400,
    INITIAL_HEIGHT: 75,
  },
};

export const Root = styled.div`
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

export const Content = styled.div`
  position: relative;
`;

export const SearchFieldWrapper = styled(motion.div)`
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: ${DIMENSIONS.INPUT.INITIAL_WIDTH}px;
  height: ${DIMENSIONS.INPUT.INITIAL_HEIGHT}px;
  background-color: #fff;
  transform-origin: top center;
`;

export const SearchField = styled.input`
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

export const ResultList = styled.ul`
  position: relative;
  z-index: 2;
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow: auto;
`;

export const ResultWrapper = styled(motion.li)`
  border-top: 1px solid #ddd;
  overflow: hidden;
`;

export const Result = styled(motion.a)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 16px;
  color: #000;
  background-color: transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 250ms ease-out;
  will-change: transform;

  &:hover {
    background-color: #ddd;
  }
`;

export const UserAvatar = styled.img`
  height: 40px;
  width: 40px;
  border-radius: 50%;
  border: 2px solid #333;
`;

export const UserName = styled.span`
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  font-weight: bold;
  max-width: 170px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const UserLogin = styled.span`
  display: inline-block;
  margin-left: 4px;
  font-size: 12px;
  opacity: 0.6;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const RepositoriesIcon = styled(FontAwesomeIcon)`
  font-size: 12px;
  opacity: 0.7;
`;

export const Repositories = styled.span`
  font-size: 14px;
  display: inline-block;
  margin-left: 4px;
`;
