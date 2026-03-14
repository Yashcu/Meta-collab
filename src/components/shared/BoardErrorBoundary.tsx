'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

export class BoardErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): State {
        return { hasError: true }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <p className="text-slate-500 text-sm">
                        Something went wrong with the board.
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false })
                            window.location.reload()
                        }}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Reload page
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}