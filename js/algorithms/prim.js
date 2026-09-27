export function runPrim(graph, startId) {
    const vertices = graph.vertices;
    if (vertices.length === 0) return { error: "Đồ thị trống!" };

    const startNode = vertices.find(v => v.id === startId) || vertices[0];
    let U = [startNode.id];
    let mstEdges = [];
    let totalWeight = 0;
    let stepsTable = [];

    let step = 1;
    while (U.length < vertices.length) {
        let minEdge = null;
        let minW = Infinity;

        // Tìm cạnh nhỏ nhất nối từ U ra ngoài U
        graph.edges.forEach(edge => {
            const inU1 = U.includes(edge.source);
            const inU2 = U.includes(edge.target);

            if ((inU1 && !inU2) || (!inU1 && inU2)) {
                if (edge.weight < minW) {
                    minW = edge.weight;
                    minEdge = edge;
                }
            }
        });

        if (!minEdge) break; // Đồ thị không liên thông

        const nextNodeId = U.includes(minEdge.source) ? minEdge.target : minEdge.source;
        U.push(nextNodeId);
        mstEdges.push(minEdge);
        totalWeight += minW;

        const v1Name = vertices.find(v => v.id === minEdge.source).name;
        const v2Name = vertices.find(v => v.id === minEdge.target).name;
        const uNames = U.map(id => vertices.find(v => v.id === id).name).join(', ');

        stepsTable.push({
            step: step++,
            uSet: `{${uNames}}`,
            edgeChoice: `(${v1Name}, ${v2Name})`,
            weight: minW,
            totalW: totalWeight
        });
    }

    return {
        totalWeight,
        mstEdges,
        stepsTable,
        isConnected: U.length === vertices.length
    };
}