export function runDijkstra(graph, startId, endId) {
    const vertices = graph.vertices;
    const n = vertices.length;
    if (n === 0) return { error: "Đồ thị trống!" };

    const startIdx = vertices.findIndex(v => v.id === startId);
    const endIdx = vertices.findIndex(v => v.id === endId);
    if (startIdx === -1 || endIdx === -1) return { error: "Đỉnh không hợp lệ!" };

    let dist = Array(n).fill(Infinity);
    let prev = Array(n).fill(null);
    let visited = Array(n).fill(false);
    let stepsTable = [];

    dist[startIdx] = 0;

    for (let step = 0; step < n; step++) {
        // Tìm đỉnh có dist nhỏ nhất chưa visited
        let u = -1;
        let minDist = Infinity;
        for (let i = 0; i < n; i++) {
            if (!visited[i] && dist[i] < minDist) {
                minDist = dist[i];
                u = i;
            }
        }

        if (u === -1 || minDist === Infinity) break;
        visited[u] = true;

        // Lưu bước vào bảng
        let labels = vertices.map((v, i) => {
            if (dist[i] === Infinity) return `${v.name}(∞)`;
            const parentName = prev[i] !== null ? vertices[prev[i]].name : '-';
            return `${v.name}(${dist[i]}, ${parentName})`;
        }).join(', ');

        stepsTable.push({
            step: step + 1,
            selectedNode: vertices[u].name,
            labels: labels
        });

        if (u === endIdx) break;

        // Cập nhật khoảng cách các đỉnh kề
        vertices.forEach((v, vIdx) => {
            if (!visited[vIdx]) {
                const edge = graph.getEdge(vertices[u].id, v.id);
                if (edge) {
                    const alt = dist[u] + edge.weight;
                    if (alt < dist[vIdx]) {
                        dist[vIdx] = alt;
                        prev[vIdx] = u;
                    }
                }
            }
        });
    }

    // Truy vết đường đi
    let path = [];
    let curr = endIdx;
    if (dist[endIdx] !== Infinity) {
        while (curr !== null) {
            path.unshift(vertices[curr]);
            curr = prev[curr];
        }
    }

    return {
        distance: dist[endIdx],
        path: path,
        stepsTable: stepsTable
    };
}