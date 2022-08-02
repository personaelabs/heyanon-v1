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
  width: 700;
  background-color: #ccccfb;
  color: black;

  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
`;

const ToolTipInner = styled.div`
  box-decoration-break: clone;
  display: inline;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
  padding: 10px 15px;
`;

export function Tooltip({ text }: { text: string }) {
  const truncatedText = text.slice(0, 10) + "..." + text.slice(-10);
  return (
    <ToolTipOuter>
      {truncatedText}
      <ToolTipText>
        <ToolTipInner>{text}</ToolTipInner>
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
