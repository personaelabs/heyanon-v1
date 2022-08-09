import React from "react";
import styled from "styled-components";

const ToolTipOuter = styled.div`
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;

  &:hover > div {
    visibility: visible;
    width: 300px;
  }
`;

const ToolTipText = styled.div`
  visibility: hidden;

  width: 300px;
  box-decoration-break: clone;
  display: flex;
  overflow-wrap: break-word;
  word-wrap: break-word;

  background-color: #ccccfb;
  color: black;

  text-align: center;
  border-radius: 6px;

  position: absolute;
  z-index: 1;
`;

const ToolTipInner = styled.div`
  width: 300px;
  padding: 5px;
`;

export function Tooltip({ text }: { text: string }) {
  const truncatedText = text.slice(0, 10) + "..." + text.slice(-10);
  return (
    <ToolTipOuter>
      {truncatedText}
      <ToolTipText>
        {" "}
        <ToolTipInner>{text}</ToolTipInner>{" "}
      </ToolTipText>
    </ToolTipOuter>
  );
}

export function InfoTooltip({
  status,
  info,
}: {
  status: string;
  info: string;
}) {
  return (
    <ToolTipOuter>
      {status}
      <ToolTipText>
        <ToolTipInner>{info}</ToolTipInner>
      </ToolTipText>
    </ToolTipOuter>
  );
}
