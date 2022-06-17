import React from 'react'

interface Action {
    onClick: any,
    children: any,
    loading: boolean,
    completed: boolean,
    loadingText: string,
    completedText?: string
}

export default function Action({ onClick, children, loading, completed, loadingText, completedText = "Done" } : Action){
    return (
        <div className="mt-6 flex max-w-4xl flex-wrap items-center justify-around sm:w-full">
            <button
            className="rounded bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
            onClick={!loading && !loading ? onClick : () => {}}
            >
            {!completed ? (loading ? loadingText : children) : completedText}
            </button>
        </div>)
}