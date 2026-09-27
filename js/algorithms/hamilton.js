export function runHamilton(graph) {
    const vertices = graph.vertices;
    const n = vertices.length;
    if (n < 3) return { status: "Đồ thị cần ít nhất 3 đỉnh để xét Hamilton." };

    // Tính bậc từng đỉnh (không tính khuyên)
    let degrees = {};
    vertices.forEach(v => degrees[v.id] = 0);
    graph.edges.forEach(e => {
        if (e.source !== e.target) {
            degrees[e.source]++;
            degrees[e.target]++;
        }
    });

    // 1. Kiểm tra Định lý Dirac (Điều kiện đủ)
    let isDirac = vertices.every(v => degrees[v.id] >= n / 2);

    // 2. Thuật toán Quay lui (Backtracking) tìm Chu trình Hamilton
    let path = [vertices[0].id];
    let visited = new Set([vertices[0].id]);
    let cycleFound = null;

    function backtrack(currId) {
        if (path.length === n) {
            // Nếu đã đi qua tất cả n đỉnh, kiểm tra đỉnh cuối có nối về đỉnh đầu không
            if (graph.getEdge(currId, path[0])) {
                cycleFound = [...path, path[0]];
                return true;
            }
                return false;
        }

        for (let v of vertices) {
            if (!visited.has(v.id) && graph.getEdge(currId, v.id)) {
                visited.add(v.id);
                path.push(v.id);

                if (backtrack(v.id)) return true;

                path.pop();
                visited.delete(v.id);
            }
        }
        return false;
    }

    backtrack(vertices[0].id);

    // Xuất thông tin chi tiết
    let info = `Số đỉnh n = ${n}.\n`;
    if (isDirac) {
        info += `✅ Thỏa mãn Định lý Dirac: Mọi đỉnh deg(v) >= ${n/2}.\n`;
    } else {
        info += `⚠️ Không thỏa mãn Định lý Dirac (có đỉnh deg < ${n/2}).\n`;
    }

    if (cycleFound) {
        const cycleNames = cycleFound.map(id => vertices.find(v => v.id === id).name).join(' → ');
        return {
            status: `✅ Có Chu trình Hamilton!`,
            info: info + `🚴 Chu trình: ${cycleNames}`,
            cycle: cycleFound
        };
    } else {
        return {
            status: `❌ KHÔNG có Chu trình Hamilton!`,
            info: info + `🔍 Đã duyệt Quay lui tất cả các khả năng nhưng không tìm thấy chu trình đi qua tất cả các đỉnh.`,
            cycle: null
        };
    }
}