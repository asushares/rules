import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { StatusService } from '../status.service';
import { BaseComponent } from '../base.component';
import { CodeSet, CodeSetCoding, Rule } from '@asushares/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-rule',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rule.component.html',
  styleUrl: './rule.component.scss',
})
export class RuleComponent extends BaseComponent {


  rule: Rule | null = null;
  selectedCodeSet: CodeSet | null = null;
  showBulkImport: boolean = false;
  showCsvImport: boolean = false;
  csvImportText: string = '';
  bulkImportSystem: string = '';
  bulkImportCodes: string = '';
  bulkImportConfidence: number = 1.0;

  supportedCodeSystems: { name: string, system: string }[] = [
    { name: 'SNOMED CT', system: 'http://snomed.info/sct' },
    { name: 'LOINC', system: 'http://loinc.org' },
    { name: 'RxNorm', system: 'http://www.nlm.nih.gov/research/umls/rxnorm' }
  ];

  codeSystemUrlToName(url: string) {
    let name: string | null = null;
    this.supportedCodeSystems.forEach(n => {
      if (n.system == url) {
        name = n.name;
      }
    });
    return name;
  }

  constructor(private route: ActivatedRoute, protected http: HttpClient, public dataService: DataService, public statusService: StatusService, public toastrService: ToastrService) {
    super();
    console.log(RuleComponent.name + " initializing.");
    this.resetBulkImport();
    this.route.paramMap.subscribe(pm => {
      let w_id = pm.get('id')!;
      this.loadRuleFor(w_id);
    });

    // this.toastrService.showInfoToast('DEBUG', 'Loaded RuleComponent');
  }


  loadRuleFor(id: string) {
    this.selectedCodeSet = null;
    this.dataService.rules_file.subscribe(rf => {
      rf?.rules.forEach(r => {
        if (id == r.id) {
          this.rule = r;
          if (!this.rule.labels) {
            this.rule.labels = [];
          }
          if (this.rule.codeSets.length > 0) {
            this.selectedCodeSet = this.rule.codeSets[0];
          }
        }
      })
    });
  }

  createLabel() {
    this.rule?.labels.push(Rule.labelFromTemplate());
  }

  deleteLabel(i: number) {
    if (i !== undefined && i > -1) {
      this.rule?.labels.splice(i, 1);
    }
  }

  createCodeSet() {
    if (this.rule) {
      const cs = Rule.codeSetFromTemplate();
      this.rule?.codeSets.push(cs);
      this.selectedCodeSet = cs;
    }
  }

  deleteCodeSet(i: number) {
    if (i !== undefined && i > -1) {
      this.rule?.codeSets.splice(i, 1);
    }
  }

  selectCodeSet(cs: CodeSet) {
    this.selectedCodeSet = cs;
  }

  createCode() {
    this.selectedCodeSet?.codes.push(CodeSet.codeFromTemplate());
  }

  duplicateCode(code: CodeSetCoding) {
    const clone: CodeSetCoding = JSON.parse(JSON.stringify(code));
    this.selectedCodeSet?.codes.push(clone);
  }

  deleteCode(i: number) {
    if (i !== undefined && i > -1) {
      this.selectedCodeSet?.codes.splice(i, 1);
    }
  }

  toggleBulkImport() {
    this.showBulkImport = !this.showBulkImport;
  }
  toggleCsvImport() {
    this.showCsvImport = !this.showCsvImport;
  }

  runBulkImport() {
    const codes = this.bulkImportCodes.split(/\s/);
    codes.forEach(n => {
      if (n != '') {
        let c = new CodeSetCoding()
        c.system = this.bulkImportSystem;
        c.code = n;
        c.confidence = this.bulkImportConfidence;
        this.selectedCodeSet?.codes.push(c);
      }
    });
    this.toastrService.success(`${codes.length} codes have been added.`, 'Import Completed');
    this.resetBulkImport();
  }

  runCsvImport() {
    const lines = this.csvImportText.split(/\n/)
      .map(n => { return n.trim(); })
      .filter(n => { return n.length > 0 });
    let errorLines: number[] = [];
    let codings: CodeSetCoding[] = [];
    lines.forEach((l, index) => {
      let [system, code, confidence]: string[] = l.split(',').map(n => { return n.trim() });
      if (!system || !code || !confidence) {
        console.log('CSV error at line ' + (index + 1));
        errorLines.push(index + 1);
        // try {
        //   Number(confidence);
        // } catch {
        //   console.log('CSV "confidence" value is not a number at line ' + (index + 1));
        //   good = false;
        // }
      } else {
        let c = new CodeSetCoding();
        c.system = system
        c.code = code;
        c.confidence = Number(confidence);
        codings.push(c);
      }
    });
    if (errorLines.length > 0) {
      console.log(`Errors found in CSV text at lines ${errorLines.join(', ')}. Cancelling.`);
      this.toastrService.warning(`Import cancelled due to CSV errors at lines ${errorLines.join(', ')}. Please fix them and try again.`, 'CSV Errors');
    } else {
      codings.forEach(c => {
        this.selectedCodeSet?.codes.push(c);
      })
      this.toastrService.success(`${lines.length} codes have been added.`, 'Import Completed');
      this.resetCsvImport();
    }
  }

  resetCsvImport() {
    this.showCsvImport = false;
    this.csvImportText = '';
  }

  resetBulkImport() {
    this.showBulkImport = false;
    this.bulkImportSystem = '';
    this.bulkImportCodes = '';
    this.bulkImportConfidence = 1.0;
  }

  deduplicateCodes(cs: CodeSet) {
    let found: CodeSetCoding[] = [];
    let dupes: number[] = [];
    cs.codes.forEach((n, i) => {
      // let tmp = n.system + n.code;
      if (found.some(f => { return f.system == n.system && f.code == n.code })) {
        dupes.push(i);
      }
      found.push(n);
    })
    dupes.reverse();
    dupes.forEach(i => {
      cs.codes.splice(i, 1);
    });
  }

}
