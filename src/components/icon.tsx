import React from 'react';
export default function ({data, icon, disable, className, onClick, active,bubbleCount}: any) {
  let iconClass = disable ? '' : (icon ? 'icon-btn' : 'icon');
  iconClass = active ? iconClass + " active" : iconClass;

  const dataName = data ? data : '';

  if(dataName=='poll_show'||dataName=='poll_create'){
    return (
    <>
      <div className={`${iconClass} ${className} notification`}  onClick={onClick} data-name={dataName}>
        <span className="badge">{bubbleCount}</span>
      </div>
    </>
    )
  }
  else
  {
  return (
    <div className={`${iconClass} ${className}`} onClick={onClick} data-name={dataName}></div>
  )
  }
}
