export class GraphCanvas {
    constructor(canvasElement, graph) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        this.graph = graph;
        
        this.nodeRadius = 22;
        this.activeTool = 'select'; // select, add-node, add-edge, erase
        this.selectedVertex = null;
        this.edgeStartVertex = null;
        this.draggedVertex = null;
        this.highlightEdges = [];
        this.highlightNodes = [];

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.initEvents();
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.render();
    }

    setTool(toolName) {
        this.activeTool = toolName;
        this.edgeStartVertex = null;
        this.render();
    }

    getVertexAt(x, y) {
        return this.graph.vertices.find(v => {
            const dist = Math.hypot(v.x - x, v.y - y);
            return dist <= this.nodeRadius;
        });
    }

    getEdgeAt(x, y) {
        return this.graph.edges.find(e => {
            const v1 = this.graph.vertices.find(v => v.id === e.source);
            const v2 = this.graph.vertices.find(v => v.id === e.target);
            if (!v1 || !v2) return false;

            // Xử lý kiểm tra click vào Khuyên (Self-loop)
            if (v1.id === v2.id) {
                const loopRadius = 20;
                const loopX = v1.x;
                const loopY = v1.y - this.nodeRadius - loopRadius + 5;
                const dist = Math.hypot(x - loopX, y - loopY);
                return Math.abs(dist - loopRadius) < 8;
            }

            // Xử lý cạnh thẳng bình thường
            const L2 = (v2.x - v1.x)**2 + (v2.y - v1.y)**2;
            if (L2 === 0) return false;
            let r = ((x - v1.x)*(v2.x - v1.x) + (y - v1.y)*(v2.y - v1.y)) / L2;
            r = Math.max(0, Math.min(1, r));
            const projX = v1.x + r*(v2.x - v1.x);
            const projY = v1.y + r*(v2.y - v1.y);
            return Math.hypot(x - projX, y - projY) < 8;
        });
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const clickedVertex = this.getVertexAt(x, y);
            const clickedEdge = this.getEdgeAt(x, y);

            if (this.activeTool === 'select') {
                if (clickedVertex) {
                    this.draggedVertex = clickedVertex;
                    this.selectedVertex = clickedVertex;
                } else {
                    this.selectedVertex = null;
                }
            } else if (this.activeTool === 'add-node') {
                if (!clickedVertex) {
                    this.graph.addVertex(x, y);
                }
            } else if (this.activeTool === 'add-edge') {
                if (clickedVertex) {
                    if (!this.edgeStartVertex) {
                        this.edgeStartVertex = clickedVertex;
                    } else {
                        // Nhấp 2 đỉnh khác nhau hoặc nhấp liên tiếp 1 đỉnh để tạo Khuyên
                        const weight = prompt("Nhập trọng số cho cạnh:", "1");
                        if (weight !== null && !isNaN(weight)) {
                            this.graph.addEdge(this.edgeStartVertex.id, clickedVertex.id, parseInt(weight) || 1);
                        }
                        this.edgeStartVertex = null;
                    }
                } else {
                    this.edgeStartVertex = null;
                }
            } else if (this.activeTool === 'erase') {
                if (clickedVertex) {
                    this.graph.removeVertex(clickedVertex.id);
                } else if (clickedEdge) {
                    this.graph.removeEdge(clickedEdge.source, clickedEdge.target);
                }
            }

            this.render();
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.draggedVertex && this.activeTool === 'select') {
                const rect = this.canvas.getBoundingClientRect();
                this.draggedVertex.x = e.clientX - rect.left;
                this.draggedVertex.y = e.clientY - rect.top;
                this.render();
            }
        });

        window.addEventListener('mouseup', () => {
            this.draggedVertex = null;
        });

        this.canvas.addEventListener('dblclick', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const clickedEdge = this.getEdgeAt(x, y);

            if (clickedEdge) {
                const newWeight = prompt("Sửa trọng số cạnh:", clickedEdge.weight);
                if (newWeight !== null && !isNaN(newWeight)) {
                    clickedEdge.weight = parseInt(newWeight) || 1;
                    this.render();
                }
            }
        });
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Vẽ cạnh & Khuyên
        this.graph.edges.forEach(edge => {
            const v1 = this.graph.vertices.find(v => v.id === edge.source);
            const v2 = this.graph.vertices.find(v => v.id === edge.target);
            if (!v1 || !v2) return;

            const isHighlighted = this.highlightEdges.some(
                e => (e.source === edge.source && e.target === edge.target) || (e.source === edge.target && e.target === edge.source)
            );

            // VẼ KHUYÊN (Self-loop)
            if (v1.id === v2.id) {
                const loopRadius = 20;
                const loopX = v1.x;
                const loopY = v1.y - this.nodeRadius - loopRadius + 5;

                this.ctx.beginPath();
                this.ctx.arc(loopX, loopY, loopRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = isHighlighted ? '#06b6d4' : 'rgba(255, 255, 255, 0.4)';
                this.ctx.lineWidth = isHighlighted ? 4 : 2;
                this.ctx.stroke();

                const weightY = loopY - loopRadius;
                this.ctx.fillStyle = '#1e293b';
                this.ctx.beginPath();
                this.ctx.arc(loopX, weightY, 11, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();

                this.ctx.fillStyle = '#6366f1';
                this.ctx.font = 'bold 12px Inter';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(edge.weight, loopX, weightY);
                return;
            }

            // VẼ CẠNH THẲNG BÌNH THƯỜNG
            this.ctx.beginPath();
            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
            this.ctx.strokeStyle = isHighlighted ? '#06b6d4' : 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = isHighlighted ? 4 : 2;
            this.ctx.stroke();

            const midX = (v1.x + v2.x) / 2;
            const midY = (v1.y + v2.y) / 2;
            
            this.ctx.fillStyle = '#1e293b';
            this.ctx.beginPath();
            this.ctx.arc(midX, midY, 12, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            this.ctx.fillStyle = '#6366f1';
            this.ctx.font = 'bold 12px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(edge.weight, midX, midY);
        });

        // 2. Vẽ đỉnh
        this.graph.vertices.forEach(v => {
            const isSelected = this.selectedVertex && this.selectedVertex.id === v.id;
            const isEdgeStart = this.edgeStartVertex && this.edgeStartVertex.id === v.id;
            const isHighlighted = this.highlightNodes.includes(v.id);

            this.ctx.beginPath();
            this.ctx.arc(v.x, v.y, this.nodeRadius, 0, Math.PI * 2);
            
            if (isHighlighted) {
                this.ctx.fillStyle = '#06b6d4';
            } else if (isEdgeStart) {
                this.ctx.fillStyle = '#f43f5e';
            } else if (isSelected) {
                this.ctx.fillStyle = '#6366f1';
            } else {
                this.ctx.fillStyle = '#1e293b';
            }
            this.ctx.fill();

            this.ctx.strokeStyle = isSelected || isHighlighted ? '#ffffff' : '#6366f1';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(v.name, v.x, v.y);
        });
    }
}