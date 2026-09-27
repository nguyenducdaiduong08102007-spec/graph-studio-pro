export function runEuler(graph) {
    const vertices = graph.vertices;
    if (vertices.length === 0) return { message: "Đồ thị trống!" };

    // Tính bậc từng đỉnh
    let degrees = {};
    vertices.forEach(v => degrees[v.id] = 0);
    graph.edges.forEach(e => {
        degrees[e.source]++;
        degrees[e.target]++;
    });

    let oddNodes = vertices.filter(v => degrees[v.id] % 2 !== 0);

    let degreeStr = vertices.map(v => `deg(${v.name}) = ${degrees[v.id]}`).join(' | ');

    if (oddNodes.length === 0) {
        return {
            type: "Chu trình Euler",
            status: "Đồ thị có Chu trình Euler (Tất cả đỉnh có bậc chẵn)",
            degrees: degreeStr
        };
    } else if (oddNodes.length === 2) {
        return {
            type: "Đường đi Euler",
            status: `Đồ thị có Đường đi Euler (Có đúng 2 đỉnh bậc lẻ: ${oddNodes.map(v=>v.name).join(', ')})`,
            degrees: degreeStr
        };
    } else {
        return {
            type: "Không Euler",
            status: `Không phải Euler (Có ${oddNodes.length} đỉnh bậc lẻ)`,
            degrees: degreeStr
        };
    }
}