import React from "react";

export default function RecurrsiveComponent({ data, parentIndex,selectedId }) {

  if (!data) {
    return null;
  }

//   console.log(parentIndex);
  let element = '\u00A0'

  for (let index = 0; index < parentIndex*2; index++) {
    element = `${element}\u00A0`;
  }

  return (
    <>
      {data.map((parent, index) => {
        // console.log(selectedId == parent.id);
        return (
          <>
            <option key={parent.id} selected={selectedId == parent.id} value={parent.id} >{element}{parent.title}</option>
            {parent.children && (
              <RecurrsiveComponent data={parent.children} parentIndex={index+1} selectedId = {selectedId}/>
            )}
          </>
        );
      })}
    </>
  );
}
