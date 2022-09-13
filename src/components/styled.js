import styled from "styled-components";

export const Container = styled.div`
  min-height: 200px;
  border: 1px solid transparent;
  margin-bottom: 10px;
`;
export const Textarea = styled.textarea`
  display: block;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
`;
export const Button = styled.button`
  padding: 8px 16px;
  margin: 0 3px;
`;
export const Table = styled.table`
  display: inline-block;
  margin-top: 20px;
  text-align: left;
`;
export const Heading = styled.h3`
  color: ${(props) => (props.success ? "green" : "red")};
`;
