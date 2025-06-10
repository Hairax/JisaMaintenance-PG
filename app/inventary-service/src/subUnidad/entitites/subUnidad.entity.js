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
exports.SubUnidad = void 0;
const typeorm_1 = require("typeorm");
const maquina_entity_1 = require("../../maquina/entities/maquina.entity");
let SubUnidad = class SubUnidad {
    id;
    maquina;
    descripcion;
    createdAt;
    updatedAt;
};
exports.SubUnidad = SubUnidad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SubUnidad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => maquina_entity_1.Maquina),
    (0, typeorm_1.JoinColumn)({ name: 'maquina_id' }),
    __metadata("design:type", maquina_entity_1.Maquina)
], SubUnidad.prototype, "maquina", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SubUnidad.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], SubUnidad.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], SubUnidad.prototype, "updatedAt", void 0);
exports.SubUnidad = SubUnidad = __decorate([
    (0, typeorm_1.Entity)()
], SubUnidad);
//# sourceMappingURL=subUnidad.entity.js.map