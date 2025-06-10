"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Maquina = void 0;
const typeorm_1 = require("typeorm");
const cost_center_entity_1 = require("../../cost-centers/entities/cost-center.entity");
const process_entity_1 = require("../../process/entities/process.entity");
const proveedor_entity_1 = require("../../proveedor/entities/proveedor.entity");
let Maquina = class Maquina {
    id;
    costCenter;
    process;
    name;
    createdAt;
    updatedAt;
    fabricante;
    tipoDeMaquina;
    numeroDeSerie;
    fechaDeFabricacion;
    fechaDeMontaje;
    costo;
    horasTrabajadas;
    proveedor;
};
exports.Maquina = Maquina;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Maquina.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cost_center_entity_1.CostCenter),
    (0, typeorm_1.JoinColumn)({ name: 'centroCosto_id' }),
    __metadata("design:type", cost_center_entity_1.CostCenter)
], Maquina.prototype, "costCenter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => process_entity_1.Process),
    (0, typeorm_1.JoinColumn)({ name: 'proceso_id' }),
    __metadata("design:type", process_entity_1.Process)
], Maquina.prototype, "process", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Maquina.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Maquina.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Maquina.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Maquina.prototype, "fabricante", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Maquina.prototype, "tipoDeMaquina", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Maquina.prototype, "numeroDeSerie", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Maquina.prototype, "fechaDeFabricacion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Maquina.prototype, "fechaDeMontaje", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Maquina.prototype, "costo", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Maquina.prototype, "horasTrabajadas", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proveedor_entity_1.Proveedor),
    (0, typeorm_1.JoinColumn)({ name: 'proveedor_id' }),
    __metadata("design:type", proveedor_entity_1.Proveedor)
], Maquina.prototype, "proveedor", void 0);
exports.Maquina = Maquina = __decorate([
    (0, typeorm_1.Entity)()
], Maquina);
//# sourceMappingURL=maquina.entity.js.map