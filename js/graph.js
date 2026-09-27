export class Vertex {
    constructor(id, name, x, y) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
    }
}

export class Edge {
    constructor(source, target, weight = 1) {
        this.source = source; // ID đỉnh 1
        this.target = target; // ID đỉnh 2
        this.weight = weight;
    }
}

export class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
        this.nextId = 0;
    }

    addVertex(x, y, name = null) {
        const id = this.nextId++;
        const vertexName = name || String.fromCharCode(65 + (id % 26)) + (id >= 26 ? Math.floor(id / 26) : '');
        const vertex = new Vertex(id, vertexName, x, y);
        this.vertices.push(vertex);
        return vertex;
    }

    removeVertex(id) {
        this.vertices = this.vertices.filter(v => v.id !== id);
        this.edges = this.edges.filter(e => e.source !== id && e.target !== id);
    }

    addEdge(sourceId, targetId, weight = 1) {
        // Hỗ trợ tạo Khuyên (Self-loop) khi sourceId === targetId
        const existing = this.getEdge(sourceId, targetId);
        if (existing) {
            existing.weight = weight;
            return existing;
        }

        const edge = new Edge(sourceId, targetId, Number(weight));
        this.edges.push(edge);
        return edge;
    }

    removeEdge(sourceId, targetId) {
        this.edges = this.edges.filter(
            e => !( (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId) )
        );
    }

    getEdge(sourceId, targetId) {
        return this.edges.find(
            e => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)
        );
    }

    clear() {
        this.vertices = [];
        this.edges = [];
        this.nextId = 0;
    }

    // Xuất ma trận kề
    getAdjacencyMatrix() {
        const n = this.vertices.length;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        
        this.edges.forEach(e => {
            const i = this.vertices.findIndex(v => v.id === e.source);
            const j = this.vertices.findIndex(v => v.id === e.target);
            if (i !== -1 && j !== -1) {
                if (i === j) {
                    matrix[i][j] = 1; // Đỉnh có khuyên
                } else {
                    matrix[i][j] = 1;
                    matrix[j][i] = 1;
                }
            }
        });
        return matrix;
    }

    // Xuất ma trận trọng số
    getWeightMatrix() {
        const n = this.vertices.length;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        
        this.edges.forEach(e => {
            const i = this.vertices.findIndex(v => v.id === e.source);
            const j = this.vertices.findIndex(v => v.id === e.target);
            if (i !== -1 && j !== -1) {
                if (i === j) {
                    matrix[i][j] = e.weight;
                } else {
                    matrix[i][j] = e.weight;
                    matrix[j][i] = e.weight;
                }
            }
        });
        return matrix;
    }
}