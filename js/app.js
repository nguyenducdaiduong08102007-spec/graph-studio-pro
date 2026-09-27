import { Graph } from './graph.js';
import { GraphCanvas } from './canvas.js';
import { runDijkstra } from './algorithms/dijkstra.js';
import { runPrim } from './algorithms/prim.js';
import { runEuler } from './algorithms/euler.js';
import { runHamilton } from './algorithms/hamilton.js';

document.addEventListener('DOMContentLoaded', () => {
    const graph = new Graph();
    const canvasElement = document.getElementById('graph-canvas');
    const canvas = new GraphCanvas(canvasElement, graph);

    // Update UI Stats
    function updateStats() {
        document.getElementById('vertex-count').textContent = graph.vertices.length;
        document.getElementById('edge-count').textContent = graph.edges.length;
        updateSelects();
        updateMatrix();
    }

    function updateSelects() {
        const startSelects = [document.getElementById('dijkstra-start'), document.getElementById('prim-start')];
        const endSelects = [document.getElementById('dijkstra-end')];

        startSelects.concat(endSelects).forEach(select => {
            const currentVal = select.value;
            select.innerHTML = '';
            graph.vertices.forEach(v => {
                const opt = document.createElement('option');
                opt.value = v.id;
                opt.textContent = v.name;
                select.appendChild(opt);
            });
            select.value = currentVal;
        });
    }

    function updateMatrix() {
        document.getElementById('adj-matrix-output').textContent = 
            graph.getAdjacencyMatrix().map(row => row.join(' ')).join('\n') || "Chưa có dữ liệu";
        document.getElementById('weight-matrix-output').textContent = 
            graph.getWeightMatrix().map(row => row.join(' ')).join('\n') || "Chưa có dữ liệu";
    }

    // Floating Toolbar
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            canvas.setTool(btn.dataset.tool);
        });
    });

    // Clear Button
    document.getElementById('btn-clear').addEventListener('click', () => {
        graph.clear();
        canvas.highlightEdges = [];
        canvas.highlightNodes = [];
        canvas.render();
        updateStats();
    });

    // Tabs Switch
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Chạy Dijkstra
    document.getElementById('btn-run-dijkstra').addEventListener('click', () => {
        const startId = parseInt(document.getElementById('dijkstra-start').value);
        const endId = parseInt(document.getElementById('dijkstra-end').value);
        
        const res = runDijkstra(graph, startId, endId);
        const resultBox = document.getElementById('dijkstra-result');
        const tableBody = document.querySelector('#dijkstra-table tbody');
        tableBody.innerHTML = '';

        if (res.error) {
            resultBox.textContent = res.error;
            return;
        }

        if (res.distance === Infinity) {
            resultBox.textContent = "Không có đường đi!";
            canvas.highlightEdges = [];
            canvas.render();
            return;
        }

        resultBox.textContent = `Độ dài ngắn nhất: ${res.distance} | Đường đi: ${res.path.map(v => v.name).join(' → ')}`;

        // Tô sáng đường đi
        let hEdges = [];
        for (let i = 0; i < res.path.length - 1; i++) {
            hEdges.push(graph.getEdge(res.path[i].id, res.path[i+1].id));
        }
        canvas.highlightEdges = hEdges;
        canvas.render();

        // Render Bảng
        res.stepsTable.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.step}</td><td><strong>${row.selectedNode}</strong></td><td>${row.labels}</td>`;
            tableBody.appendChild(tr);
        });
    });

    // Chạy Prim
    document.getElementById('btn-run-prim').addEventListener('click', () => {
        const startId = parseInt(document.getElementById('prim-start').value);
        const res = runPrim(graph, startId);
        const resultBox = document.getElementById('prim-result');
        const tableBody = document.querySelector('#prim-table tbody');
        tableBody.innerHTML = '';

        if (res.error) {
            resultBox.textContent = res.error;
            return;
        }

        resultBox.textContent = `Tổng trọng số MST: ${res.totalWeight}`;
        canvas.highlightEdges = res.mstEdges;
        canvas.render();

        res.stepsTable.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${row.step}</td><td>${row.uSet}</td><td>${row.edgeChoice}</td><td>${row.weight}</td><td>${row.totalW}</td>`;
            tableBody.appendChild(tr);
        });
    });

    // Chạy Euler
    document.getElementById('btn-run-euler').addEventListener('click', () => {
        const res = runEuler(graph);
        document.getElementById('euler-result').textContent = res.status;
        document.getElementById('euler-degree-info').textContent = res.degrees;
    });

    // Chạy Hamilton
    document.getElementById('btn-run-hamilton').addEventListener('click', () => {
        const res = runHamilton(graph);
        document.getElementById('hamilton-result').textContent = res.status;
        document.getElementById('hamilton-theorem-info').innerText = res.info;
    });

    // Preset Graphs
    document.getElementById('preset-select').addEventListener('change', (e) => {
        graph.clear();
        const type = e.target.value;
        if (type === 'dijkstra') {
            const a = graph.addVertex(150, 200, 'A');
            const b = graph.addVertex(300, 100, 'B');
            const c = graph.addVertex(300, 300, 'C');
            const d = graph.addVertex(450, 200, 'D');
            graph.addEdge(a.id, b.id, 4);
            graph.addEdge(a.id, c.id, 2);
            graph.addEdge(b.id, c.id, 1);
            graph.addEdge(b.id, d.id, 5);
            graph.addEdge(c.id, d.id, 8);
        }
        canvas.render();
        updateStats();
    });

    // Lắng nghe thao tác trên canvas để cập nhật UI
    canvasElement.addEventListener('mouseup', () => updateStats());
});