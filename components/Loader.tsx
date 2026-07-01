import React from 'react'

const Loader = () => {
    return (
        <div className='bg-black/80 absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center z-50'>
            <div className='text-blue-950 font-extrabold text-5xl animate-spin'>
                <svg width="64px" height="64px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none" className="hds-flight-icon--animation-loading"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g fill="#bc9710" fillRule="evenodd" clipRule="evenodd"> <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8z" opacity=".2"></path> <path d="M7.25.75A.75.75 0 018 0a8 8 0 018 8 .75.75 0 01-1.5 0A6.5 6.5 0 008 1.5a.75.75 0 01-.75-.75z"></path> </g> </g></svg>
            </div>
        </div>
    )
}

export default Loader