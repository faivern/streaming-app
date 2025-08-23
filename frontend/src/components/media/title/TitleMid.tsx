import React from 'react'

type TitleMidProps = {
    children: React.ReactNode;
    className?: string;
}

const TitleMid = ({ children, className }: TitleMidProps) => {
  return (
      <h2 className={`mb-4 text-2xl font-semibold border-l-4 border-sky-500 pl-2 ${className}`}>
        {children}
      </h2>
  )
}

export default TitleMid