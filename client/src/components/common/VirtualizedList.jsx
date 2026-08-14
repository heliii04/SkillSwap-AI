import React from "react";
import { FixedSizeList as List } from "react-window";

/**
 * Reusable Virtualized List Component using react-window
 * Renders only visible viewport DOM nodes for high-volume datasets.
 *
 * @param {Array} items - List items array
 * @param {number} height - Container viewport height in pixels (default: 500)
 * @param {number} itemHeight - Individual item row height in pixels (default: 80)
 * @param {Function} renderItem - Render function receiving ({ item, index, style })
 */
export default function VirtualizedList({
    items = [],
    height = 500,
    itemHeight = 80,
    renderItem,
    className = "",
}) {
    if (!items || items.length === 0) {
        return null;
    }

    const Row = ({ index, style }) => {
        const item = items[index];
        return (
            <div style={style} className="px-1 py-1">
                {renderItem({ item, index })}
            </div>
        );
    };

    return (
        <div className={`w-full overflow-hidden ${className}`}>
            <List
                height={height}
                itemCount={items.length}
                itemSize={itemHeight}
                width="100%"
            >
                {Row}
            </List>
        </div>
    );
}
