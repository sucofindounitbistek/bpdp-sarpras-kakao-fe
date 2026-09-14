# API Contract Reference: Master Sarpras Integration

**Feature**: `072-master-paket-sarpras-integration`
**Date**: 2026-09-03

## Consumed Endpoints

| Method | Endpoint | Description | Frontend Consumer |
|--------|----------|-------------|-------------------|
| `GET` | `/api/v1/master/kategori-sarpras` | List all 9 sarpras categories | `masterSarprasStore.fetchKategori()` |
| `GET` | `/api/v1/master/paket-sarpras` | List all 13 active packages & rules | `masterSarprasStore.fetchPaket()` |
| `GET` | `/api/v1/master/paket-sarpras/:code` | Detail package info | `masterSarprasStore.getPaketDetail(code)` |
| `GET` | `/api/v1/master/paket-sarpras/:code/persyaratan` | Document checklist for a package | `masterSarprasStore.fetchPersyaratan(code)` |
| `GET` | `/api/v1/master/dokumen-persyaratan` | Document template catalog | `masterSarprasStore.fetchDokumenCatalog()` |
| `GET` | `/api/v1/master/syarat-lahan` | Recognized land rights list | `masterSarprasStore.fetchSyaratLahan()` |
